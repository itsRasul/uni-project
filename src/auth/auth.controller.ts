import { VerifyEmailPhoneNumberDto } from './dtos/verify-email-phoneNumber.dto';
import {
  Body,
  Controller,
  Post,
  Res,
  UseGuards,
  BadRequestException,
  Param,
  Get,
  Req,
  HttpStatus,
  Query,
  Logger,
  Delete,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { SignupDto } from './dtos/signup.dto';
import { LoginDto } from './dtos/login.dto';
import { AuthGuard } from './guard/auth.guard';
import { CurrentUser } from './decorators/current-user.decorator';
import { User } from 'src/user/User.entity';
import { ForgotPasswordDto } from './dtos/forgot-password.dto';
import { ResetPasswordDto } from './dtos/reset-password.dto';
import { Request, Response } from 'express';
import {
  ApiBadRequestResponse,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiExcludeEndpoint,
  ApiOkResponse,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { AuthGuard as AuthGuardPassport } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@ApiTags('Authentication')
@Controller('/api/v1/auth')
export class AuthController {
  private readonly logger = new Logger(AuthController.name);
  constructor(
    private userService: UserService,
    private authService: AuthService,
    private usersService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    // private userCacheService: UserCacheService,
  ) {}

  @ApiOperation({
    summary: 'User Signup or Login',
    description: 'Registers a new user or login using google.',
  })
  @Get('google')
  // @UseGuards(AuthGuardPassport('google'))
  googleLogin() {}

  @ApiExcludeEndpoint() // ignore this API in doc
  @Get('google/callback')
  // @UseGuards(AuthGuardPassport('google'))
  async googleLoginCallback(@Req() req: any, @Res() res: Response) {
    // const googleToken = req.user.accessToken;
    // const googleRefreshToken = req.user.refreshToken;
    // console.log(req.user);
    // res.cookie('access_token', googleToken, { httpOnly: true });
    // res.cookie('refresh_token', googleRefreshToken, {
    // httpOnly: true,
    // });

    const { firstName, lastName, email } = req.user;
    const user = await this.usersService.findByEmailOrCreate(email, firstName, lastName);
    const token = await this.authService.signToken(user);

    const refreshToken = this.usersService.generateRefreshToken();
    await this.usersService.saveRefreshToken(refreshToken, user);

    this.authService.setTokenToCookie(res, token, refreshToken);

    res.status(200).json({
      status: 'success',
      message: 'you are logged in successfully',
      data: {
        user,
        token,
        refreshToken,
      },
    });
    // res.redirect('http://localhost:3000/api/v1/auth/profile');
  }

  // @UseGuards(CheckTokenExpiryGuard)
  // @Get('profile')
  // async getProfile(@Req() req: any) {
  //   const accessToken = req.cookies['access_token'];
  //   if (accessToken) return (await this.authService.getProfile(accessToken)).data;
  //   throw new UnauthorizedException('No access token');
  // }

  // @Get('logout')
  // logoutGoogle(@Req() req: any, @Res() res: Response) {
  //   const refreshToken = req.cookies['refresh_token'];
  //   res.clearCookie('access_token');
  //   res.clearCookie('refresh_token');
  //   this.authService.revokeGoogleToken(refreshToken);
  //   res.redirect('http://localhost:3000/');
  // }

  @ApiOperation({
    summary: 'User Signup',
    description: 'Registers a new user.',
  })
  @ApiQuery({ name: 'inviteCode', required: false })
  @ApiCreatedResponse({
    status: 201,
    description: 'User successfully registered.',
    type: () => User,
  })
  @ApiConflictResponse({
    status: 409,
    description: 'Conflict - User already exists.',
  })
  @ApiBody({ type: SignupDto })
  @Post('/signup')
  async signup(@Body() body: SignupDto, @Res() res: Response) {
    const { emailOrPhoneNumber, password, firstName, lastName } = body;
    const { email, phoneNumber } = this.userService.extractEmailAndPhoneNumber(emailOrPhoneNumber);

    const { user, token, refreshToken } = await this.authService.signup(
      email,
      phoneNumber,
      firstName,
      lastName,
      password,
    );
    // this.authService.setTokenToCookie(res, token, refreshToken);

    res.status(HttpStatus.CREATED).json({
      status: 'success',
      message: 'You have successfully registered',
      data: {
        user,
        token,
        refreshToken,
      },
    });
  }

  @ApiOperation({ summary: 'User Login' })
  @ApiBody({ type: LoginDto, description: 'User credentials for login' })
  @ApiOkResponse({ status: 200, description: 'Successful login', type: User })
  @ApiBadRequestResponse({ status: 400, description: 'Bad Request' })
  @ApiUnauthorizedResponse({ status: 401, description: 'Unauthorized' })
  @Post('/login')
  async login(@Body() body: LoginDto, @Res() res: Response) {
    const { emailOrPhoneNumber, password } = body;
    const { email, phoneNumber } = this.userService.extractEmailAndPhoneNumber(emailOrPhoneNumber);

    const { user, token, refreshToken } = await this.authService.login(
      email,
      phoneNumber,
      password,
    );

    // this.authService.setTokenToCookie(res, token, refreshToken);

    res.status(200).json({
      status: 'success',
      message: 'You have successfully logged in',
      data: {
        user,
        token,
        refreshToken,
      },
    });
  }

  @ApiOperation({
    summary: 'Send Verification Code via SMS',
    description: 'Sends a verification code via SMS to verifiying phoneNumber',
  })
  @ApiOkResponse({
    status: 200,
    description: 'Verification code sent successfully.',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request - Invalid or already verified phone number.',
  })
  @Post('/send-verification-code-via-SMS')
  @UseGuards(AuthGuard)
  async sendVerificationCodeViaSMS(@CurrentUser() user: User) {
    if (!user.phoneNumber) {
      throw new BadRequestException(
        'Enter your mobile number first, then confirm your mobile number',
      );
    }

    if (user.isPhoneNumberVerified) {
      throw new BadRequestException('your phone number has already verified');
    }

    const secret = await this.authService.generateSecretCode(user);
    await this.usersService.setVerificationSecretCode(user, secret);
    await this.authService.sendVerificationCodeViaSMS(user);

    const maskedPhoneNumber = this.userService.maskPhoneNumber(user.phoneNumber);

    return {
      status: 'success',
      message: `The confirmation code was sent to mobile number ${maskedPhoneNumber}`,
    };
  }

  @ApiOperation({
    summary: 'Verify Phone Number',
    description: 'Verifies the phone number using the provided verification code.',
  })
  @ApiOkResponse({
    status: 200,
    description: 'Phone number verified successfully.',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request - Incorrect verification code.',
  })
  @ApiBody({ type: VerifyEmailPhoneNumberDto })
  @Post('/verify-phone-number')
  @UseGuards(AuthGuard)
  async verifyPhoneNumber(@CurrentUser() user: User, @Body() body: VerifyEmailPhoneNumberDto) {
    const isValid = await this.authService.verifyCode(user, body.verificationCode);

    if (!isValid) {
      throw new BadRequestException('the entered code is incorrect');
    }

    await this.userService.phoneNumberVerified(user);

    return {
      status: 'success',
      message: 'Your mobile number has been successfully verified.',
    };
  }

  @ApiOperation({
    summary: 'Send Verification Code via Email',
    description: 'Sends a verification code via email.',
  })
  @ApiOkResponse({
    status: 200,
    description: 'Verification code sent successfully.',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request - Invalid or already verified email.',
  })
  @Post('/send-verification-code-via-email')
  @UseGuards(AuthGuard)
  async sendVerificationCodeViaEmail(@CurrentUser() user: User) {
    if (!user.email) {
      throw new BadRequestException('Enter your email first, then confirm your email');
    }

    if (user.isEmailVerified) {
      throw new BadRequestException('your email has already verified');
    }

    const secret = await this.authService.generateSecretCode(user);
    await this.usersService.setVerificationSecretCode(user, secret);
    await this.authService.sendVerificationCodeViaEmail(user);

    const maskedEmail = this.userService.maskEmail(user.email);

    return {
      status: 'success',
      message: `Confirmation code was sent to email ${maskedEmail}`,
    };
  }

  @Post('/verify-email')
  @ApiOperation({
    summary: 'Verify Email',
    description: 'Verifies the email using the provided verification code.',
  })
  @ApiResponse({
    status: 200,
    description: 'Email verified successfully.',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad Request - Incorrect verification code.',
  })
  @ApiBody({ type: VerifyEmailPhoneNumberDto })
  @UseGuards(AuthGuard)
  async verifyEmail(
    @CurrentUser() user: User,
    @Body() body: VerifyEmailPhoneNumberDto,
  ): Promise<any> {
    const isValid = await this.authService.verifyCode(user, body.verificationCode);

    if (!isValid) {
      throw new BadRequestException('the entered code is incorrect');
    }

    await this.userService.emailVerified(user);

    return {
      status: 'success',
      message: 'Your email has been successfully verified',
    };
  }

  @ApiOperation({
    summary: 'Forgot Password',
    description: 'Sends a reset password code via email or SMS.',
  })
  @ApiOkResponse({
    status: 200,
    description: 'Reset password code sent successfully.',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request - Invalid email or phone number.',
  })
  @ApiBody({ type: ForgotPasswordDto })
  @Post('/forgot-password')
  async forgotPassword(@Body() body: ForgotPasswordDto) {
    const { email, phoneNumber } = this.userService.extractEmailAndPhoneNumber(
      body.emailOrPhoneNumber,
    );

    const user = await this.usersService.findOneByEmailOrPhoneNumber(email, phoneNumber);

    const { email: userEmail, phoneNumber: userPhoneNumber } =
      this.usersService.checkEmailOrPhoneNumberVerified(user);

    const resetPasswordToken = this.authService.generateResetPasswordToken();
    const hashedResetPasswordToken = this.userService.hashResetPasswordToken(resetPasswordToken);
    await this.usersService.setResetPasswordToken(user, hashedResetPasswordToken);

    if (userPhoneNumber) {
      await this.authService.sendResetPasswordTokenViaSMS(user, resetPasswordToken);
    } else if (userEmail) {
      await this.authService.sendResetPasswordTokenViaEmail(user, resetPasswordToken);
    }

    return {
      status: 'success',
      message: userEmail
        ? `The code to change the password was sent to email: ${userEmail}`
        : `The code to change the password was sent to the phone number: ${userPhoneNumber}`,
    };
  }

  @ApiOperation({
    summary: 'Reset Password',
    description: 'Resets the user password using the provided reset password token.',
  })
  @ApiParam({
    name: 'resetPasswordToken',
    description: 'The reset password token received via email or SMS.',
    example: '5797013',
  })
  @ApiBody({ type: ResetPasswordDto })
  @ApiOkResponse({
    status: 200,
    description: 'Password reset successful.',
  })
  @ApiBadRequestResponse({
    status: 400,
    description: 'Bad Request - Invalid reset password token or new password.',
  })
  @Post('/reset-password/:resetPasswordToken')
  async resetPassword(
    @Param('resetPasswordToken') resetPasswordToken: string,
    @Body() body: ResetPasswordDto,
  ) {
    const hashedResetPasswordToken = this.userService.hashResetPasswordToken(resetPasswordToken);

    const user = await this.usersService.findOneByResetPasswordToken(hashedResetPasswordToken);

    await this.usersService.setNewPassword(user, body.newPassword);

    return {
      status: 'success',
      message: 'your password is updated successfully',
    };
  }

  @ApiOperation({
    summary: 'Get My Profile',
    description: 'Retrieves the profile of the authenticated user.',
  })
  @ApiOkResponse({
    status: 200,
    description: 'Profile retrieved successfully.',
  })
  @ApiUnauthorizedResponse({
    status: 401,
    description: 'Unauthorized - Invalid or expired token.',
  })
  @Get('/profile')
  @UseGuards(AuthGuard)
  async getMyProfile(@CurrentUser() currentUser: User) {
    const user = await this.usersService.findById(currentUser.id);

    const userWithoutSensitiveData = this.usersService.userWithoutSensitiveData(user);

    return {
      status: 'success',
      message: 'your profile is received successfully',
      data: {
        user: userWithoutSensitiveData,
      },
    };
  }

  @ApiOperation({
    summary: 'Logout',
    description: 'Logs out the user by clearing the authentication token.',
  })
  @ApiOkResponse({
    status: 200,
    description: 'Logout successful.',
  })
  @Delete('/logout')
  async logout(@Req() req: Request, @Res() res: Response) {
    res.status(HttpStatus.NO_CONTENT).clearCookie('token').clearCookie('refresh_token').json({
      status: 'success',
      message: 'you are logged out successfully!',
    });
  }

  // in this controller, i check whether a user is logged in or not, and we don't throw error if it is not
  @Get('/isLoggedIn')
  async isLoggedIn(@Req() req: Request) {
    const [token, refreshToken] = this.authService.extractTokenFromHeader(req);
    if (!token) {
      return { isLoggedIn: false };
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      const user = await this.userService.findById(payload.id)
      // access token is valid, so user is logged in
      return { isLoggedIn: true, firstName: user.firstName, lastName: user.lastName, role: user.role };
    } catch (error) {
      if (error instanceof NotFoundException) {
        return { isLoggedIn: false };
      }
      if (!refreshToken) {
        return { isLoggedIn: false };
      }
      const userRefreshToken = await this.userService.findOneByRefreshToken(refreshToken);
      if (!userRefreshToken) {
        return { isLoggedIn: false };
      }
      const isRefreshTokenValid = this.userService.validateRefreshToken(refreshToken);
      if (!isRefreshTokenValid) {
        return { isLoggedIn: false };
      }
      // refresh token is there and is valid, so the user is logged in.
      return { isLoggedIn: true, firstName: userRefreshToken.firstName, lastName: userRefreshToken.lastName, role: userRefreshToken.role };
    }
  }
}
