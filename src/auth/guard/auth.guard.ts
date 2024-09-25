import { UserService } from './../../user/user.service';
import {
  CanActivate,
  ExecutionContext,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { User } from 'src/user/User.entity';
import { ConfigService } from '@nestjs/config';
import { NotFoundError } from 'rxjs';

declare module 'express' {
  interface Request {
    user: User;
  }
}

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UserService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();

    const [token, refreshToken] = this.extractTokenFromHeader(request);
    if (!token) {
      throw new UnauthorizedException('You are not logged in, log in first and then try again');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });

      const user = await this.usersService.findById(payload.id);

      request.user = user;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw new NotFoundException('user is not exsit by id provided in token');
      }
      // FIX THIS FUNCTION, THE SERVICE IS NOT IMPLEMENTED YET, COMMENT THE SERVICE OUT
      await this.usersService.generateNewAccessTokenIfRefreshTokenValid(
        refreshToken,
        response,
        request,
      );
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): [string, string] {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    const accessToken = type === 'Bearer' ? token : undefined;
    const refreshToken = request.headers['refresh-token'];

    console.log({ accessToken });
    console.log({ refreshToken });

    return [accessToken, refreshToken as string];
  }

  private extractTokenFromCookie(request: Request): [string, string] {
    console.log('req.cookies: ');
    console.log(request.cookies);
    const token = request.cookies.token;
    const refreshToken = request.cookies.refresh_token;

    console.log({ token });
    console.log({ refreshToken });


    return [token, refreshToken];
  }
}
