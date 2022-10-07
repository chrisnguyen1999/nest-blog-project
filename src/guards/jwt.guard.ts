import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { DecoratorKey } from '~/config/constants';
import { AuthType } from '~/modules/auth/types';

@Injectable()
export class JwtGuard
    extends AuthGuard(AuthType.JWT_AT)
    implements CanActivate
{
    constructor(private readonly reflector: Reflector) {
        super();
    }

    canActivate(context: ExecutionContext) {
        const isPublic = this.reflector.getAllAndOverride<boolean>(
            DecoratorKey.ROUTE_PUBLIC,
            [context.getHandler(), context.getClass()]
        );

        if (isPublic) return true;

        return super.canActivate(context);
    }
}
