import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { User } from 'src/user/User.entity';

export const CurrentUser = createParamDecorator((data: unknown, ctx: ExecutionContext): User => {
  const request: Request = ctx.switchToHttp().getRequest();
  return request.user;
});
