import { UserService } from './../../user/user.service';
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { jwtConstants } from '../constants';
import { Request } from 'express';
// import { UserCacheService } from 'src/cache/services/user.cache.service';
import { User } from 'src/user/User.entity';
import { ConfigService } from '@nestjs/config';

// we just to find out a user is logged in or not,
// we don't prevent user to go next controller if not be logged in
@Injectable()
export class IsLoggedIn implements CanActivate {
  constructor(
    private jwtService: JwtService,
    private usersService: UserService,
    // private userCacheService: UserCacheService,
    private configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    // const token = this.extractTokenFromHeader(request);
    const token = this.extractTokenFromCookie(request);
    if (!token) {
      return true;
    }

    try {
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('JWT_SECRET'),
      });
      let user: User;

      // user = await this.userCacheService.getUserCache(payload.id);

      if (!user) {
        // if user is not found in cache, query in DB
        user = await this.usersService.findById(payload.id);
      }

      request['user'] = user;
    } catch {
      return true;
    }
    return true;
  }

  private extractTokenFromHeader(request: Request): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }

  private extractTokenFromCookie(request: Request): string | undefined {
    const token = request.cookies.token;

    return token;
  }
}
