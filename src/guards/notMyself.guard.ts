import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { User } from '~/modules/user/entities';

@Injectable()
export class NotMyselfGuard implements CanActivate {
    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();

        const user: User = request.user;
        const { id } = request.params;

        return user.id !== +id;
    }
}
