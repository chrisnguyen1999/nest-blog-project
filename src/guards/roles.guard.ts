import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { DecoratorKey } from '~/config/constants';
import { User } from '~/modules/user/entities';
import { UserRole } from '~/modules/user/types';

@Injectable()
export class RolesGuard implements CanActivate {
    constructor(private readonly reflector: Reflector) {}

    canActivate(context: ExecutionContext): boolean {
        const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
            DecoratorKey.USER_ROLE,
            [context.getHandler(), context.getClass()]
        );
        if (!requiredRoles) {
            return true;
        }

        const user: User = context.switchToHttp().getRequest().user;

        return requiredRoles.includes(user.role);
    }
}
