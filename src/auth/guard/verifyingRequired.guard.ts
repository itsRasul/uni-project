import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { User } from 'src/user/User.entity';

@Injectable()
export class VerifyingRequiredGuard implements CanActivate {
  constructor() {}

  async canActivate(context: ExecutionContext): Promise<boolean | never> {
    const request = context.switchToHttp().getRequest();
    const user: User = request.user;

    if (!user?.isPhoneNumberVerified && !user?.isEmailVerified) {
      throw new ForbiddenException('Verify your mobile number or email first, then try again');
    }
    return true;
  }
}
