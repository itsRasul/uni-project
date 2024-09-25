import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import userRolesEnum from 'src/user/enums/userRoles.enum';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private requiredRoles: userRolesEnum[]) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredRoles = this.requiredRoles || [];

    if (!requiredRoles?.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();

    const { role: userRole } = request.user;

    const isAuthorized = requiredRoles.some((role) => role === userRole);

    if (!isAuthorized) {
      throw new ForbiddenException('you are forbidden to access this part');
    }

    return true;
  }
}

export const RolesGuardFactory = (requiredRoles: userRolesEnum[]) => {
  return new RolesGuard(requiredRoles);
};
