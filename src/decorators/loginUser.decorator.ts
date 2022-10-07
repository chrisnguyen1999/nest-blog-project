import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { User } from '~/modules/user/entities';

export const LoginUser = createParamDecorator<
    keyof User,
    ExecutionContext,
    User
>((data, ctx) => {
    const request = ctx.switchToHttp().getRequest();

    if (data) return request.user[data];

    return request.user;
});
